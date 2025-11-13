import React from "react";

type Props = { updated: string };

const Footer: React.FC<Props> = ({ updated }) => <div>Last Updated: {updated}</div>;

export default Footer;
