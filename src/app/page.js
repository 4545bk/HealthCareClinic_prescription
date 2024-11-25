"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [medication, setMedication] = useState("");
  const [description, setDescription] = useState("");
  const [rxCUI, setRxCUI] = useState("");
  const [medlinePlusURL, setMedlinePlusURL] = useState("");
  const [patientName, setPatientName] = useState("");

  // Fetch medication description and MedlinePlus URL from the API
  const fetchDescription = async () => {
    if (!medication) {
      alert("Please enter a medication name.");
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${medication}`);
      const data = await response.json();

      if (response.ok) {
        setDescription(data.description);
        setRxCUI(data.rxCUI);
        setMedlinePlusURL(data.medlinePlusURL);
      } else {
        setDescription("Medication not found or no description available.");
        setRxCUI("");
        setMedlinePlusURL("");
      }
    } catch (error) {
      console.error("Error fetching medication description:", error);
      setDescription("An error occurred while fetching the description.");
      setRxCUI("");
      setMedlinePlusURL("");
    }
  };

  // Handle PDF generation
  const handlePrint = () => {
    if (!patientName || !medication || !description) {
      alert("Please fill all fields and fetch a description before printing.");
      return;
    }

    const doc = new jsPDF();

    try {
      doc.addImage("/logo.png", "PNG", 10, 10, 30, 30); // Optional logo
    } catch (error) {
      console.warn("Logo not found or failed to load.");
    }

    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Medical Prescription", 50, 20);
    doc.text(`Patient: ${patientName}`, 20, 60);
    doc.text(`Medication: ${medication}`, 20, 80);
    doc.text(`Description: ${description}`, 20, 100);
    doc.text("Doctor's Signature: ____________________", 20, 140);

    doc.save(`${patientName}_prescription.pdf`);
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", backgroundColor: "#f7f9fc", minHeight: "100vh" }}>
      {/* Header Section */}
      <header style={{
        background: "linear-gradient(135deg, #0044cc, #007bff)",
        padding: "30px 20px",
        color: "white",
        textAlign: "center",
        borderRadius: "0 0 15px 15px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
      }}>
        <img src="/logo.png" alt="Hospital Logo" style={{ height: "70px", marginBottom: "10px" }} />
        <h1 style={{ fontSize: "32px", margin: 0 }}>Betelhem  HealthCare Clinic</h1>
        <p style={{ fontSize: "16px", marginTop: "5px", fontStyle: "italic" }}>Your Trusted Medical Partner</p>
      </header>
      

      {/* Main Content */}
      <main style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
        <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", padding: "20px" }}>
          <h2 style={{ textAlign: "center", color: "#0044cc", marginBottom: "20px" }}>Generate Prescription</h2>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
              Patient Name:
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
              Medication:
              <input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Enter medication name"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
            </label>
            <button
              onClick={fetchDescription}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#0044cc",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                display: "block",
                margin: "10px auto 0",
              }}
            >
              Search Medications
            </button>
          </div>

          {description && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  padding: "20px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3 style={{ color: "#0044cc", fontWeight: "bold", fontSize: "18px", textAlign: "center", marginBottom: "10px" }}>
                  <span style={{ marginRight: "10px" }}>💊</span>Medication Details
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0" }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: "bold", color: "#555", padding: "8px 0" }}>Name:</td>
                      <td style={{ color: "#222", padding: "8px 0" }}>{medication}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold", color: "#555", padding: "8px 0" }}>Type:</td>
                      <td style={{ color: "#28a745", padding: "8px 0" }}>
                      {description
                        .split(", ")
                        .find(line => line.startsWith("Type:"))?.replace("Type:", "").trim() || "N/A"}
                    </td>
                                        </tr>
                    <tr>
                    <td style={{ fontWeight: "bold", color: "#555", padding: "8px 0" }}>Synonym:</td>
                    <td style={{ color: "#007BFF", padding: "8px 0" }}>
                      {
                        description.split(", ")
                          .find(line => line.startsWith("Synonym:"))
                          ?.replace("Synonym:", "")
                          .trim() || "N/A"
                      }
                    </td>
                  </tr>
                  
                  </tbody>
                </table>
                {medlinePlusURL && (
                  <a
                    href={medlinePlusURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      padding: "10px 15px",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    Learn More 
                  </a>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handlePrint}
            style={{
              padding: "15px 30px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              display: "block",
              margin: "0 auto",
            }}
          >
            Print Prescription
          </button>
        </div>
      </main>
    </div>
  );
}
