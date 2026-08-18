import { Link } from "react-router-dom";

import "./BackButton.css";

interface BackButtonProps {
  to: string;
  label: string;
}

function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link to={to} className="back-button">
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}

export default BackButton;
