import React from "react";

type Props = { updated: string };

const Footer: React.FC<Props> = ({ updated }) => (
  <div>Last Updated: {updated || "N/A"}</div>
);

export default Footer;
