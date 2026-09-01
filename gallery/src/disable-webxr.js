/**
 * Gallery is inline 3D, not a headset session. A-Frame still probes
 * navigator.xr.isSessionSupported("immersive-vr") on import, which makes
 * Brave on iOS show a permission sheet that cannot be accepted (WebGL
 * canvas eats the taps). Hide WebXR before A-Frame loads.
 */
try {
  if (navigator.xr) {
    Object.defineProperty(navigator, "xr", {
      value: undefined,
      configurable: true,
    });
  }
} catch {
  /* ignore */
}
