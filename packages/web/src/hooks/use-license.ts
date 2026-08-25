import { useCallback, useEffect, useState } from "react";
import { clearLicense, getStoredLicense, storeLicense, verifyLicense } from "@/lib/license";

export function useLicense() {
  const [licenseKey, setLicenseKey] = useState<string | null>(() => getStoredLicense());
  const [isLicensed, setIsLicensed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!licenseKey) {
      setIsLicensed(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    verifyLicense(licenseKey)
      .then(({ valid }) => {
        if (cancelled) return;
        setIsLicensed(valid);
        if (!valid) clearLicense();
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [licenseKey]);

  const activate = useCallback((key: string) => {
    storeLicense(key);
    setLicenseKey(key);
  }, []);

  const deactivate = useCallback(() => {
    clearLicense();
    setLicenseKey(null);
    setIsLicensed(false);
  }, []);

  return { isLicensed, checking, licenseKey, activate, deactivate };
}
