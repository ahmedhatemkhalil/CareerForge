const PdfIcon = ({ className = "size-4" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
            fill="#EF4444"
        />
        <path d="M14 2v6h6" fill="#DC2626" />
        <text
            x="12"
            y="16"
            textAnchor="middle"
            fill="white"
            fontSize="5.5"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
        >
            PDF
        </text>
    </svg>
);

export default PdfIcon;
