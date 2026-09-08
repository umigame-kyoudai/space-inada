export function Brand() {
  return (
    <span className="site-brand">
      <svg
        width="31"
        height="38"
        viewBox="0 0 31 38"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15.5 2v34M1 19h29M5.5 9l20 20M5.5 29l20-20"
          stroke="currentColor"
          strokeWidth=".8"
        />
        <path
          d="M15.5 8c1.5 7 3.5 9 10.5 11-7 1.5-9 3.5-10.5 11C14 22.5 12 20.5 5 19c7-2 9-4 10.5-11Z"
          fill="currentColor"
        />
      </svg>
      <span>
        <span className="brand-wordmark">KEY PHOTO</span>
        <span className="brand-caption">MIYAKOJIMA · 星空フォト</span>
      </span>
    </span>
  );
}
