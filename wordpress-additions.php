<?php
/* ============================================================
   PicturePerfectTones — Digital Downloads Addition  v2
   ============================================================
   HOW TO INSTALL:
   1. In WordPress admin go to: Snippets → All Snippets
   2. Open your existing "PicturePerfectTones — Complete CMS Setup v5" snippet
   3. Scroll to the very bottom and APPEND the code below
   4. Update the three configuration constants (PPT_API_SECRET,
      PPT_RZP_KEY_ID, PPT_RZP_KEY_SECRET) before saving
   5. Save & Activate

   ALSO SET IN REPLIT (server-side env vars — NOT VITE_ prefixed):
   - WP_URL                  = your WordPress site URL (e.g. https://pictureperfecttones.com)
   - PPT_API_SECRET          = same value as PPT_API_SECRET constant below
   - RAZORPAY_KEY_ID         = your Razorpay Key ID
   - RAZORPAY_KEY_SECRET     = your Razorpay Secret Key
   - RAZORPAY_WEBHOOK_SECRET = your Razorpay webhook secret (from Razorpay dashboard)

   ALSO SET (for public content only, VITE_ prefix IS needed):
   - VITE_WP_URL          = your WordPress site URL (same value as WP_URL above)
   ============================================================ */


/* ──────────────────────────────────────────────────────────
   CONFIGURATION — Update these before activating
   ────────────────────────────────────────────────────────── */
if ( ! defined('PPT_API_SECRET') ) {
    define('PPT_API_SECRET',    'change-this-to-a-random-secret');   // Must match VITE_PPT_API_SECRET in Replit
}
if ( ! defined('PPT_RZP_KEY_ID') ) {
    define('PPT_RZP_KEY_ID',    'rzp_live_YOURKEY');                 // Razorpay Key ID
}
if ( ! defined('PPT_RZP_KEY_SECRET') ) {
    define('PPT_RZP_KEY_SECRET','your-razorpay-secret-key');         // Razorpay Secret Key — needed for server-side verification
}


/* ──────────────────────────────────────────────────────────
   9. UPDATED CORS — Allow POST/PUT in addition to GET
   Runs at priority 11 so it overrides the GET-only CORS
   set in section 1 (priority 10)
   ────────────────────────────────────────────────────────── */
add_action('init', function () {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-PPT-Secret');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { status_header(200); exit(); }
}, 11);


/* ──────────────────────────────────────────────────────────
   10. DATABASE TABLES
   - ppt_orders         : one row per paid order
   - ppt_preset_files   : one row per preset, stores the zip file
   - ppt_download_tokens: tracks individual download events per item
   All use IF NOT EXISTS — safe to run multiple times
   ────────────────────────────────────────────────────────── */
add_action('init', function () {
    if ( get_option('ppt_downloads_db_v2') ) return;

    global $wpdb;
    $cc = $wpdb->get_charset_collate();

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    dbDelta("CREATE TABLE IF NOT EXISTS {$wpdb->prefix}ppt_orders (
        id             bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        token          varchar(64)         NOT NULL,
        customer_name  varchar(255)        NOT NULL DEFAULT '',
        customer_email varchar(255)        NOT NULL DEFAULT '',
        customer_phone varchar(20)         NOT NULL DEFAULT '',
        items          longtext            NOT NULL DEFAULT '',
        total          decimal(10,2)       NOT NULL DEFAULT 0,
        payment_id     varchar(100)        NOT NULL DEFAULT '',
        created_at     datetime            NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY token (token),
        UNIQUE KEY payment_id (payment_id)
    ) $cc;");

    dbDelta("CREATE TABLE IF NOT EXISTS {$wpdb->prefix}ppt_preset_files (
        id          bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        preset_id   varchar(100)        NOT NULL,
        filename    varchar(255)        NOT NULL DEFAULT '',
        file_url    varchar(500)        NOT NULL DEFAULT '',
        file_path   varchar(500)        NOT NULL DEFAULT '',
        uploaded_at datetime            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY preset_id (preset_id)
    ) $cc;");

    dbDelta("CREATE TABLE IF NOT EXISTS {$wpdb->prefix}ppt_download_tokens (
        id             bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id       bigint(20) UNSIGNED NOT NULL,
        order_token    varchar(64)         NOT NULL,
        preset_id      varchar(100)        NOT NULL,
        download_count int(11) UNSIGNED    NOT NULL DEFAULT 0,
        last_downloaded datetime           DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY order_token_preset (order_token, preset_id),
        KEY order_id (order_id)
    ) $cc;");

    update_option('ppt_downloads_db_v2', true);
    delete_option('ppt_downloads_db_v1'); // remove old marker if present
}, 20);


/* ──────────────────────────────────────────────────────────
   11. AUTH HELPERS
   ────────────────────────────────────────────────────────── */

/**
 * Returns true if X-PPT-Secret header matches the configured secret.
 * Returns WP_Error on failure.
 */
function ppt_verify_secret( WP_REST_Request $request ) {
    $secret = defined('PPT_API_SECRET') ? PPT_API_SECRET : '';

    if ( empty($secret) || $secret === 'change-this-to-a-random-secret' ) {
        return new WP_Error('no_secret', 'API secret not configured on server', ['status' => 500]);
    }

    $sent = $request->get_header('x_ppt_secret');
    if ( ! hash_equals($secret, (string) $sent) ) {
        return new WP_Error('unauthorized', 'Invalid API secret', ['status' => 401]);
    }

    return true;
}

/** Permission callback for admin-only routes. */
function ppt_auth_required( WP_REST_Request $request ) {
    $result = ppt_verify_secret($request);
    return ! is_wp_error($result);
}


/* ──────────────────────────────────────────────────────────
   12. REST ENDPOINTS
   ────────────────────────────────────────────────────────── */
add_action('rest_api_init', function () {

    /* ── POST /ppt/v1/save-order ─────────────────────────── */
    register_rest_route('ppt/v1', '/save-order', [
        'methods'             => 'POST',
        'callback'            => 'ppt_save_order',
        'permission_callback' => 'ppt_auth_required',   // requires X-PPT-Secret header
    ]);

    /* ── GET /ppt/v1/download/{token} ────────────────────── */
    register_rest_route('ppt/v1', '/download/(?P<token>[a-zA-Z0-9]+)', [
        'methods'             => 'GET',
        'callback'            => 'ppt_handle_download',
        'permission_callback' => '__return_true',        // token is the credential
    ]);

    /* ── POST /ppt/v1/upload-zip ─────────────────────────── */
    register_rest_route('ppt/v1', '/upload-zip', [
        'methods'             => 'POST',
        'callback'            => 'ppt_upload_zip',
        'permission_callback' => 'ppt_auth_required',
    ]);

    /* ── GET /ppt/v1/orders ──────────────────────────────── */
    register_rest_route('ppt/v1', '/orders', [
        'methods'             => 'GET',
        'callback'            => 'ppt_get_orders',
        'permission_callback' => 'ppt_auth_required',
    ]);

    /* ── GET /ppt/v1/preset-file/{preset_id} ────────────── */
    register_rest_route('ppt/v1', '/preset-file/(?P<preset_id>[a-zA-Z0-9_%-]+)', [
        'methods'             => 'GET',
        'callback'            => 'ppt_get_preset_file',
        'permission_callback' => 'ppt_auth_required',   // admin-only: returns direct file URLs
    ]);
});


/* ──────────────────────────────────────────────────────────
   CALLBACK: Save Order
   Security layers:
     1. X-PPT-Secret header verified by permission_callback
     2. Razorpay payment is verified server-to-server before saving
     3. UNIQUE constraint on payment_id prevents duplicate orders
   ────────────────────────────────────────────────────────── */
function ppt_save_order( WP_REST_Request $request ) {
    global $wpdb;

    $data = $request->get_json_params();
    if ( empty($data) ) {
        return new WP_Error('bad_request', 'Invalid or empty JSON body', ['status' => 400]);
    }

    $payment_id    = sanitize_text_field($data['payment_id']     ?? '');
    $customer_name = sanitize_text_field($data['customer_name']  ?? '');
    $customer_email= sanitize_email($data['customer_email']      ?? '');
    $customer_phone= sanitize_text_field($data['customer_phone'] ?? '');
    $items         = is_array($data['items']) ? $data['items'] : [];
    $total         = floatval($data['total']                     ?? 0);

    if ( ! $payment_id || ! is_email($customer_email) ) {
        return new WP_Error('missing_fields', 'payment_id and a valid customer_email are required', ['status' => 400]);
    }

    // ── Idempotency: if this payment was already processed, return existing token ──
    $existing = $wpdb->get_row($wpdb->prepare(
        "SELECT id, token FROM {$wpdb->prefix}ppt_orders WHERE payment_id = %s",
        $payment_id
    ));
    if ( $existing ) {
        return rest_ensure_response([
            'success'   => true,
            'token'     => $existing->token,
            'duplicate' => true,
        ]);
    }

    // ── Server-side payment verification via Razorpay API ──
    $rzp_key_id     = defined('PPT_RZP_KEY_ID')     ? PPT_RZP_KEY_ID     : '';
    $rzp_key_secret = defined('PPT_RZP_KEY_SECRET')  ? PPT_RZP_KEY_SECRET : '';

    $keys_configured = $rzp_key_id && $rzp_key_secret
        && $rzp_key_id     !== 'rzp_live_YOURKEY'
        && $rzp_key_secret !== 'your-razorpay-secret-key';

    if ( $keys_configured ) {
        $rzp_response = wp_remote_get(
            "https://api.razorpay.com/v1/payments/{$payment_id}",
            [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode("{$rzp_key_id}:{$rzp_key_secret}"),
                ],
                'timeout' => 15,
            ]
        );

        if ( is_wp_error($rzp_response) ) {
            return new WP_Error(
                'rzp_unreachable',
                'Could not verify payment with Razorpay: ' . $rzp_response->get_error_message(),
                ['status' => 502]
            );
        }

        $rzp_status = wp_remote_retrieve_response_code($rzp_response);
        if ( $rzp_status !== 200 ) {
            return new WP_Error('rzp_error', "Razorpay returned HTTP {$rzp_status} for payment {$payment_id}", ['status' => 502]);
        }

        $rzp_body = json_decode(wp_remote_retrieve_body($rzp_response), true);

        if ( ($rzp_body['status'] ?? '') !== 'captured' ) {
            return new WP_Error(
                'payment_not_captured',
                'Payment not captured. Status: ' . ($rzp_body['status'] ?? 'unknown'),
                ['status' => 402]
            );
        }

        // Hard amount validation — prevents payment-ID reuse / underpayment fraud.
        $expected_paise = intval(round($total * 100));
        $actual_paise   = intval($rzp_body['amount'] ?? 0);
        if ( $expected_paise > 0 && abs($actual_paise - $expected_paise) > 1 ) {
            error_log("PPT FRAUD: amount mismatch for {$payment_id}: expected {$expected_paise} paise, Razorpay says {$actual_paise} paise");
            return new WP_Error(
                'amount_mismatch',
                'Payment amount does not match order total.',
                ['status' => 402]
            );
        }

    } else {
        // Razorpay keys not configured — hard-fail to protect paid delivery
        return new WP_Error(
            'razorpay_not_configured',
            'Payment verification unavailable. Server not configured.',
            ['status' => 503]
        );
    }

    // ── Generate unique download token ──
    $token = bin2hex(random_bytes(24));  // 48 hex chars, cryptographically random

    // ── Save order ──
    $inserted = $wpdb->insert(
        $wpdb->prefix . 'ppt_orders',
        [
            'token'          => $token,
            'customer_name'  => $customer_name,
            'customer_email' => $customer_email,
            'customer_phone' => $customer_phone,
            'items'          => wp_json_encode($items),
            'total'          => $total,
            'payment_id'     => $payment_id,
        ],
        ['%s','%s','%s','%s','%s','%f','%s']
    );

    if ( ! $inserted ) {
        // Could be a race-condition duplicate — try fetching again
        $race = $wpdb->get_row($wpdb->prepare(
            "SELECT token FROM {$wpdb->prefix}ppt_orders WHERE payment_id = %s",
            $payment_id
        ));
        if ( $race ) {
            return rest_ensure_response(['success' => true, 'token' => $race->token, 'duplicate' => true]);
        }
        return new WP_Error('db_error', 'Failed to save order: ' . $wpdb->last_error, ['status' => 500]);
    }

    $order_id = $wpdb->insert_id;

    // ── Create download token row per item ──
    foreach ( $items as $item ) {
        $preset_id = sanitize_text_field($item['id'] ?? '');
        if ( ! $preset_id ) continue;
        $wpdb->insert(
            $wpdb->prefix . 'ppt_download_tokens',
            [
                'order_id'    => $order_id,
                'order_token' => $token,
                'preset_id'   => $preset_id,
            ],
            ['%d','%s','%s']
        );
    }

    // ── Build per-item download links ──
    $download_links = ppt_build_download_links($items, $token);

    // ── Send confirmation email ──
    ppt_send_confirmation_email($customer_email, $customer_name, $items, $total, $token, $download_links);

    return rest_ensure_response([
        'success'        => true,
        'token'          => $token,
        'download_links' => $download_links,
    ]);
}


/* ──────────────────────────────────────────────────────────
   HELPER: Build per-item download link array
   ────────────────────────────────────────────────────────── */
function ppt_build_download_links( $items, $token ) {
    global $wpdb;
    $site_url = get_site_url();
    $links = [];

    foreach ( $items as $item ) {
        $preset_id = sanitize_text_field($item['id']   ?? '');
        $name      = sanitize_text_field($item['name'] ?? $preset_id);

        $file = $wpdb->get_row($wpdb->prepare(
            "SELECT file_url, filename FROM {$wpdb->prefix}ppt_preset_files WHERE preset_id = %s",
            $preset_id
        ));

        $links[] = [
            'preset_id'    => $preset_id,
            'name'         => $name,
            'download_url' => "{$site_url}/wp-json/ppt/v1/download/{$token}?item=" . urlencode($preset_id),
            'file_ready'   => ! empty($file->file_url),
        ];
    }

    return $links;
}


/* ──────────────────────────────────────────────────────────
   CALLBACK: Download Handler
   Token is the credential — no other auth needed.
   Tracks download count per item in ppt_download_tokens.
   ────────────────────────────────────────────────────────── */
function ppt_handle_download( WP_REST_Request $request ) {
    global $wpdb;

    $token     = sanitize_text_field($request['token']);
    $preset_id = sanitize_text_field($request->get_param('item') ?? '');

    // Validate order token
    $order = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}ppt_orders WHERE token = %s",
        $token
    ));

    if ( ! $order ) {
        return new WP_Error('invalid_token', 'Download link is invalid', ['status' => 404]);
    }

    if ( $preset_id ) {
        // Verify this preset was in the order via download_tokens table
        $dt = $wpdb->get_row($wpdb->prepare(
            "SELECT id, download_count FROM {$wpdb->prefix}ppt_download_tokens
             WHERE order_token = %s AND preset_id = %s",
            $token, $preset_id
        ));

        if ( ! $dt ) {
            return new WP_Error('not_in_order', 'This preset was not part of the order', ['status' => 403]);
        }

        $file = $wpdb->get_row($wpdb->prepare(
            "SELECT file_url, filename FROM {$wpdb->prefix}ppt_preset_files WHERE preset_id = %s",
            $preset_id
        ));

        if ( ! $file || ! $file->file_url ) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Download file is not yet available for this preset. Our team is uploading it shortly — please check your email or contact support.',
            ]);
        }

        // Increment download count
        $wpdb->update(
            $wpdb->prefix . 'ppt_download_tokens',
            [
                'download_count'  => $dt->download_count + 1,
                'last_downloaded' => current_time('mysql'),
            ],
            ['id' => $dt->id],
            ['%d','%s'],
            ['%d']
        );

        // Redirect to file
        wp_redirect($file->file_url, 302);
        exit;
    }

    // No item param — return all download links as JSON (used on Thank You page)
    $parsed_items = json_decode($order->items, true) ?? [];
    $links = ppt_build_download_links($parsed_items, $token);

    return rest_ensure_response([
        'success'        => true,
        'customer_name'  => $order->customer_name,
        'customer_email' => $order->customer_email,
        'items'          => $links,
    ]);
}


/* ──────────────────────────────────────────────────────────
   CALLBACK: Upload Zip File (admin-only, requires X-PPT-Secret)
   Stores files in /wp-content/uploads/ppt-presets/
   ────────────────────────────────────────────────────────── */
function ppt_upload_zip( WP_REST_Request $request ) {
    global $wpdb;

    $preset_id = sanitize_text_field($request->get_param('preset_id') ?? '');
    if ( ! $preset_id ) {
        return new WP_Error('missing_preset_id', 'preset_id parameter is required', ['status' => 400]);
    }

    if ( empty($_FILES['file']) ) {
        return new WP_Error('no_file', 'No file uploaded (multipart field: file)', ['status' => 400]);
    }

    $file = $_FILES['file'];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ( $ext !== 'zip' ) {
        return new WP_Error('invalid_type', 'Only .zip files are allowed', ['status' => 400]);
    }

    if ( ! function_exists('wp_handle_upload') ) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
    }

    // Store in /wp-content/uploads/ppt-presets/
    add_filter('upload_dir', 'ppt_presets_upload_dir');
    add_filter('upload_mimes', function($mimes) { $mimes['zip'] = 'application/zip'; return $mimes; });

    $overrides = ['test_form' => false, 'test_type' => false];
    $result    = wp_handle_upload($file, $overrides);

    remove_filter('upload_dir', 'ppt_presets_upload_dir');

    if ( isset($result['error']) ) {
        return new WP_Error('upload_error', $result['error'], ['status' => 500]);
    }

    $filename  = basename($result['file'] ?? $file['name']);
    $file_url  = $result['url']  ?? '';
    $file_path = $result['file'] ?? '';

    // Upsert into ppt_preset_files
    $existing_id = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM {$wpdb->prefix}ppt_preset_files WHERE preset_id = %s",
        $preset_id
    ));

    if ( $existing_id ) {
        $wpdb->update(
            $wpdb->prefix . 'ppt_preset_files',
            ['filename' => $filename, 'file_url' => $file_url, 'file_path' => $file_path],
            ['preset_id' => $preset_id],
            ['%s','%s','%s'],
            ['%s']
        );
    } else {
        $wpdb->insert(
            $wpdb->prefix . 'ppt_preset_files',
            ['preset_id' => $preset_id, 'filename' => $filename, 'file_url' => $file_url, 'file_path' => $file_path],
            ['%s','%s','%s','%s']
        );
    }

    return rest_ensure_response([
        'success'   => true,
        'filename'  => $filename,
        'url'       => $file_url,
        'preset_id' => $preset_id,
    ]);
}

/** Custom upload directory — /wp-content/uploads/ppt-presets/ */
function ppt_presets_upload_dir( $dirs ) {
    $dirs['subdir'] = '/ppt-presets';
    $dirs['path']   = $dirs['basedir'] . '/ppt-presets';
    $dirs['url']    = $dirs['baseurl'] . '/ppt-presets';
    return $dirs;
}


/* ──────────────────────────────────────────────────────────
   CALLBACK: List Orders (admin, requires X-PPT-Secret)
   Includes per-item download counts from ppt_download_tokens
   ────────────────────────────────────────────────────────── */
function ppt_get_orders( WP_REST_Request $request ) {
    global $wpdb;

    $orders = $wpdb->get_results(
        "SELECT o.id, o.token, o.customer_name, o.customer_email, o.customer_phone,
                o.items, o.total, o.payment_id, o.created_at
         FROM {$wpdb->prefix}ppt_orders o
         ORDER BY o.created_at DESC
         LIMIT 500"
    );

    if ( ! $orders ) {
        return rest_ensure_response([]);
    }

    // Attach download counts
    foreach ( $orders as &$order ) {
        $tokens = $wpdb->get_results($wpdb->prepare(
            "SELECT preset_id, download_count, last_downloaded
             FROM {$wpdb->prefix}ppt_download_tokens
             WHERE order_token = %s",
            $order->token
        ));
        $order->download_counts = $tokens ?: [];
    }
    unset($order);

    return rest_ensure_response($orders);
}


/* ──────────────────────────────────────────────────────────
   CALLBACK: Get Preset File metadata (public, for admin UI)
   ────────────────────────────────────────────────────────── */
function ppt_get_preset_file( WP_REST_Request $request ) {
    global $wpdb;

    $preset_id = sanitize_text_field(urldecode($request['preset_id']));
    $file = $wpdb->get_row($wpdb->prepare(
        "SELECT filename, file_url FROM {$wpdb->prefix}ppt_preset_files WHERE preset_id = %s",
        $preset_id
    ));

    if ( ! $file ) {
        return new WP_Error('not_found', 'No file found for this preset', ['status' => 404]);
    }

    return rest_ensure_response(['filename' => $file->filename, 'url' => $file->file_url]);
}


/* ──────────────────────────────────────────────────────────
   EMAIL: Beautiful HTML confirmation with per-item download buttons
   ────────────────────────────────────────────────────────── */
function ppt_send_confirmation_email( $to, $name, $items, $total, $token, $download_links ) {
    $brand_name = 'Picture Perfect Tones';
    $reply_to   = get_option('admin_email');
    $subject    = "Your {$brand_name} Purchase — Download Ready";

    $items_html = '';
    foreach ( $download_links as $link ) {
        if ( $link['file_ready'] ) {
            $action_html = '<a href="' . esc_url($link['download_url']) . '"
                style="display:inline-block;background:#B08D5B;color:#ffffff;padding:10px 22px;
                       border-radius:5px;text-decoration:none;font-size:13px;font-weight:600;
                       letter-spacing:0.08em;">Download Now</a>';
        } else {
            $action_html = '<span style="color:#9A9088;font-size:13px;font-style:italic;">
                File is being prepared — we\'ll email you when it\'s ready.</span>';
        }

        $items_html .= '
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #F0EBE3;">
            <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;color:#2C2825;">'
                . esc_html($link['name']) . '</p>
            <p style="margin:0 0 12px;font-size:12px;color:#9A9088;letter-spacing:0.05em;text-transform:uppercase;">
                Lightroom Preset Pack · XMP + DNG</p>
            ' . $action_html . '
          </td>
        </tr>';
    }

    $total_fmt = '&#8377;' . number_format($total, 0, '.', ',');
    $support_url = 'https://wa.me/918962801172';

    $body = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F9F6F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="580" cellpadding="0" cellspacing="0"
       style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

  <!-- Header -->
  <tr><td style="background:#B08D5B;padding:40px;text-align:center;">
    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#ffffff;">'
        . esc_html($brand_name) . '</p>
    <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.7);">
        Payment Confirmed</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:36px 44px 0;">
    <p style="font-family:Georgia,serif;font-size:20px;color:#2C2825;margin:0 0 10px;">
        Hello, ' . esc_html($name) . '!</p>
    <p style="font-size:14px;color:#5A544D;line-height:1.75;margin:0 0 28px;">
        Thank you for your purchase. Your preset files are ready — click the button below each preset to download.
    </p>
  </td></tr>

  <!-- Items -->
  <tr><td style="padding:0 44px;">
    <table width="100%" cellpadding="0" cellspacing="0">' . $items_html . '</table>
  </td></tr>

  <!-- Total -->
  <tr><td style="padding:24px 44px;">
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#FDF9F3;border-radius:10px;padding:16px 20px;">
      <tr>
        <td style="font-size:12px;color:#9A9088;text-transform:uppercase;letter-spacing:0.12em;">
            Total Paid</td>
        <td align="right" style="font-family:Georgia,serif;font-size:22px;color:#2C2825;">'
            . $total_fmt . '</td>
      </tr>
    </table>
  </td></tr>

  <!-- Permanent link notice -->
  <tr><td style="padding:0 44px 28px;">
    <p style="font-size:12px;color:#9A9088;line-height:1.7;margin:0;">
        These download links are <strong>permanent</strong> — bookmark this email or
        return to it any time to re-download your files.
    </p>
  </td></tr>

  <!-- Support -->
  <tr><td style="padding:0 44px 36px;text-align:center;">
    <p style="font-size:12px;color:#B0A89E;line-height:1.7;margin:0;">
        Need help? Reach us on
        <a href="' . esc_url($support_url) . '" style="color:#B08D5B;text-decoration:none;">WhatsApp</a>
        or reply to this email — we respond within 24 hours.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#F9F6F0;padding:20px 44px;border-top:1px solid #EDE8E0;text-align:center;">
    <p style="margin:0;font-size:11px;color:#C4B8A8;letter-spacing:0.18em;text-transform:uppercase;">
        ' . esc_html($brand_name) . '</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>';

    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        "Reply-To: {$reply_to}",
        "From: {$brand_name} <{$reply_to}>",
    ];

    return wp_mail($to, $subject, $body, $headers);
}

/* ──────────────────────────────────────────────────────────
   ACF — Preset Zip File upload field on Preset post type
   Requires: Advanced Custom Fields (free or Pro) plugin
   ────────────────────────────────────────────────────────── */
add_action('acf/init', function () {
    if ( ! function_exists('acf_add_local_field_group') ) return;

    acf_add_local_field_group([
        'key'      => 'group_ppt_preset_files',
        'title'    => 'Preset Download Files',
        'fields'   => [
            [
                'key'           => 'field_ppt_preset_zip',
                'label'         => 'Preset Zip File',
                'name'          => 'preset_zip_file',
                'type'          => 'file',
                'instructions'  => 'Upload the ZIP file customers will download after purchase. Use a strong filename (no spaces).',
                'required'      => 0,
                'return_format' => 'url',   // returns the file URL directly
                'library'       => 'all',
                'mime_types'    => 'zip,application/zip',
            ],
        ],
        'location' => [
            [
                [
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'preset',  // adjust if your CPT slug differs
                ],
            ],
        ],
        'menu_order'            => 5,
        'position'              => 'normal',
        'style'                 => 'default',
        'label_placement'       => 'top',
        'instruction_placement' => 'label',
        'active'                => true,
    ]);
});

/* ============================================================
   END PicturePerfectTones — Digital Downloads Addition  v2
   ============================================================ */
