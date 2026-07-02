import React from "react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="mb-4">You can reach us via email or follow our social profiles:</p>

      <ul className="space-y-2">
        <li>
          <strong>Email:</strong> malikwork72@gmail.com
        </li>
        <li>
          <strong>Facebook:</strong>{" "}
          <a href="https://www.facebook.com/profile.php?id=61582089132682" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
            https://www.facebook.com/profile.php?id=61582089132682
          </a>
        </li>
        <li>
          <strong>LinkedIn:</strong>{" "}
          <a href="https://www.linkedin.com/in/malik-abdullah-jan-zia-a596963a2/" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
            https://www.linkedin.com/in/malik-abdullah-jan-zia-a596963a2/
          </a>
        </li>
        <li>
          <strong>Instagram:</strong>{" "}
          <a href="https://www.instagram.com/aq_gaming_hub_official/" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
            https://www.instagram.com/aq_gaming_hub_official/
          </a>
        </li>
      </ul>
    </div>
  );
}
