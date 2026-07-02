import React from "react";

export default function DmcaPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">DMCA & Copyright</h1>
      <p className="mb-4">
        If you believe that content on our site infringes your copyright, please provide a DMCA takedown notice with the following information:
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li>Your contact information (name, address, phone, email)</li>
        <li>Identification of the copyrighted work claimed to be infringed</li>
        <li>Location of the infringing material (URL)</li>
        <li>A statement that you have a good faith belief that use is not authorized</li>
        <li>Electronic or physical signature</li>
      </ol>
      <p className="mt-4">Send DMCA notices to: malikwork72@gmail.com</p>
    </div>
  );
}
