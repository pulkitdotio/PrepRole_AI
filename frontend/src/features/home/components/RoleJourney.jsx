const journeyPath = 'M 72 426 C 142 394 119 334 205 316 C 303 296 287 237 378 211 C 470 185 461 126 548 88';

function RoleJourney() {
  return (
    <div className="role-journey" aria-hidden="true">
      <div className="role-journey__ambient role-journey__ambient--one" />
      <div className="role-journey__ambient role-journey__ambient--two" />

      <svg
        className="role-journey__art"
        viewBox="0 0 620 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="journey-path" x1="72" y1="426" x2="548" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#55D6D0" />
            <stop offset="0.48" stopColor="#6D8CFF" />
            <stop offset="1" stopColor="#A88CFF" />
          </linearGradient>
          <radialGradient id="journey-destination" cx="0" cy="0" r="1" gradientTransform="translate(539 78) rotate(51) scale(64)">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.22" stopColor="#BFD1FF" />
            <stop offset="0.58" stopColor="#7B8FFF" />
            <stop offset="1" stopColor="#6859C7" stopOpacity="0" />
          </radialGradient>
          <filter id="journey-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="journey-orb-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>

        <g className="role-journey__grid">
          <path d="M 85 455 L 515 455 L 579 392" />
          <path d="M 115 480 L 545 480 L 596 430" />
          <path d="M 93 380 L 500 380 L 574 310" />
        </g>

        <g className="role-journey__particles">
          <circle cx="109" cy="254" r="2" />
          <circle cx="268" cy="141" r="1.5" />
          <circle cx="431" cy="108" r="2" />
          <circle cx="503" cy="262" r="1.5" />
          <circle cx="348" cy="373" r="1.5" />
        </g>

        <path className="role-journey__path-glow" d={journeyPath} />
        <path className="role-journey__path-base" d={journeyPath} />
        <path className="role-journey__path-light" d={journeyPath} />

        <g className="role-journey__checkpoint role-journey__checkpoint--context">
          <circle className="role-journey__checkpoint-halo" cx="72" cy="426" r="22" />
          <circle className="role-journey__checkpoint-ring" cx="72" cy="426" r="10" />
          <circle className="role-journey__checkpoint-core" cx="72" cy="426" r="3.5" />
          <text x="46" y="466">ROLE CONTEXT</text>
        </g>

        <g className="role-journey__checkpoint role-journey__checkpoint--prepare">
          <circle className="role-journey__checkpoint-halo" cx="205" cy="316" r="24" />
          <circle className="role-journey__checkpoint-ring" cx="205" cy="316" r="11" />
          <circle className="role-journey__checkpoint-core" cx="205" cy="316" r="4" />
          <text x="174" y="353">PREPARE</text>
        </g>

        <g className="role-journey__checkpoint role-journey__checkpoint--practice">
          <circle className="role-journey__checkpoint-halo" cx="378" cy="211" r="27" />
          <circle className="role-journey__checkpoint-ring" cx="378" cy="211" r="12" />
          <circle className="role-journey__checkpoint-core" cx="378" cy="211" r="4" />
          <text x="338" y="250">PRACTICE</text>
        </g>

        <g className="role-journey__checkpoint role-journey__checkpoint--improve">
          <circle className="role-journey__checkpoint-halo" cx="475" cy="165" r="25" />
          <circle className="role-journey__checkpoint-ring" cx="475" cy="165" r="10" />
          <circle className="role-journey__checkpoint-core" cx="475" cy="165" r="3.5" />
          <text x="437" y="202">IMPROVE</text>
        </g>

        <g className="role-journey__destination">
          <circle className="role-journey__destination-glow" cx="548" cy="88" r="55" />
          <circle className="role-journey__destination-orbit role-journey__destination-orbit--outer" cx="548" cy="88" r="43" />
          <circle className="role-journey__destination-orbit role-journey__destination-orbit--inner" cx="548" cy="88" r="30" />
          <circle className="role-journey__destination-orb" cx="548" cy="88" r="17" />
          <circle className="role-journey__destination-core" cx="543" cy="82" r="4" />
          <text className="role-journey__destination-label" x="500" y="31">YOUR NEXT ROLE</text>
          <text className="role-journey__destination-note" x="501" y="143">ROLE READY</text>
        </g>
      </svg>

      <div className="role-journey__caption">
        <span>Built from your experience</span>
        <i />
        <span>Focused on what comes next</span>
      </div>
    </div>
  );
}

export default RoleJourney;
