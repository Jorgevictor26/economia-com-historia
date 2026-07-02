import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

const googleWebClientId =
    '1079210835329-9ecclkcslavkn7tqivu1jd3dtl8i4g2r.apps.googleusercontent.com';

GoogleSignIn buildGoogleSignIn() {
  return GoogleSignIn(
    clientId: kIsWeb ? googleWebClientId : null,
    scopes: const ['email'],
  );
}
