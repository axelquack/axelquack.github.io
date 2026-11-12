# Bugfixes

Durable bug writeups. One heading per bug: `BF-NNN`. Keep the number. Do not reuse it.

## BF-001 — iOS gallery hangings do not animate from video

- Status: open (workaround in place)
- Date: 2026-08-27
- Symptom: A hanging that uses a video texture stays on the still poster on iOS.
- Cause: WebKit will not use a video element as a texture.
- Policy: iOS hangings use the filmstrip PNG. Do not rely on a video texture there.
- Checked: recorded from the changelog on 2026-11-12. **Unverified** in a browser during this change.

## BF-002 — Gallery motion modal blocks some mobile browsers

- Status: open (workaround in place)
- Date: 2026-09-01
- Symptom: The room does not start when the browser cannot accept the immersive-website motion modal.
- Cause: Probing WebXR shows that modal.
- Policy: Do not probe WebXR. Desktop look is pointer lock. A phone uses the walk stick and drag-to-look. Gyro is requested on the first tap only where the browser allows it.
- Checked: recorded from the changelog on 2026-11-12. **Unverified** in a browser during this change.
