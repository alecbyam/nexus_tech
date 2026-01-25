/**
 * Composant pour les codes de vérification des moteurs de recherche
 * Ajoute les meta tags nécessaires pour Google, Bing, Yandex, etc.
 */
export function SEOVerification() {
  const verificationCodes = {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    baidu: process.env.NEXT_PUBLIC_BAIDU_VERIFICATION,
    pinterest: process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION,
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION,
  }

  return (
    <>
      {/* Google Search Console */}
      {verificationCodes.google && (
        <meta
          name="google-site-verification"
          content={verificationCodes.google}
        />
      )}

      {/* Bing Webmaster Tools (Yahoo) */}
      {verificationCodes.bing && (
        <meta
          name="msvalidate.01"
          content={verificationCodes.bing}
        />
      )}

      {/* Yandex Webmaster */}
      {verificationCodes.yandex && (
        <meta
          name="yandex-verification"
          content={verificationCodes.yandex}
        />
      )}

      {/* Baidu */}
      {verificationCodes.baidu && (
        <meta
          name="baidu-site-verification"
          content={verificationCodes.baidu}
        />
      )}

      {/* Pinterest */}
      {verificationCodes.pinterest && (
        <meta
          name="p:domain_verify"
          content={verificationCodes.pinterest}
        />
      )}

      {/* Facebook Domain Verification */}
      {verificationCodes.facebook && (
        <meta
          name="facebook-domain-verification"
          content={verificationCodes.facebook}
        />
      )}
    </>
  )
}
