<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'k178057_wp_3xnnf' );

/** MySQL database username */
define( 'DB_USER', 'k178057_wp_stj7t' );

/** MySQL database password */
define( 'DB_PASSWORD', '19XwU@MxC#IC5T#7' );

/** MySQL hostname */
define( 'DB_HOST', '10.35.46.29:3306' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', '3rZMqLr-m3T|9+S+K6&/fBNl5:6ll3m546d3#]jG+092JT[NI70@7XWu+q&ZHTc@');
define('SECURE_AUTH_KEY', 'vty6EsI)7x&+a:R1w0@_~hW%r|EE1Jd#wwYCA8VlIfK2waC2t0B4]GsX4i77%)XO');
define('LOGGED_IN_KEY', ';2&s899Kp4]M)0-U2M@YfJ#Y/r]]D98~gmG%MsJBP7/cRM+KK99!V@b7b/#Q+kTa');
define('NONCE_KEY', 'Yj@M2bzX8c)&o771b78@*6VEUUk61@*045!1bqw3!80N9Y_#Q/HGuG42q8M_1%Yy');
define('AUTH_SALT', 'Zx8two608WI:*(]2qi0%99#6J5:MTD1L*q;#:6pWLXC8j;1Qt9M+]1#Ee8337bmr');
define('SECURE_AUTH_SALT', 'Aruo7o:~491lKnvFU1X2r98#xY2;E!c0X4~PO[;1!FT97Wz|4L_K84Dm0+:e421m');
define('LOGGED_IN_SALT', 'L)x6GMO%42bY;u!db;j98%cG[E5]0F098cXGwe0Oyd2RxL9_Ch5D|HIr51Z0wNlu');
define('NONCE_SALT', 'Do-&&O)q@9g#z!6P940|K-~wq+*0OTVL~]Y18yG;F28VjW70V_94ls+ih:ffSi06');

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'XuogOy_';


define('WP_ALLOW_MULTISITE', true);
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
