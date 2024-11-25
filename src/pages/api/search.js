export default async function handler(req, res) {
    const { query } = req.query;
  
    if (!query) {
      return res.status(400).json({ error: 'Medication query is required' });
    }
  
    try {
      // Step 1: Fetch RxCUI based on the medication name
      const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${query}`);
      const data = await response.json();
  
      if (!data?.idGroup?.rxnormId) {
        return res.status(404).json({ error: 'Medication not found in RxNorm database' });
      }
  
      const rxCUI = data.idGroup.rxnormId[0];
  
      // Step 2: Fetch additional medication details using RxCUI
      const detailsResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCUI}/properties.json`);
      const propertiesData = await detailsResponse.json();
  
      const medicationName = propertiesData?.properties?.name || query;
      const synonym = propertiesData?.properties?.synonym || 'No synonym available';
      const tty = propertiesData?.properties?.tty || 'No type available';
  
      // Map tty to user-friendly descriptions
      const typeMapping = {
        IN: 'Ingredient',
        SCD: 'Semantic Clinical Drug',
        BN: 'Brand Name',
      };
      const typeDescription = typeMapping[tty] || tty;
  
      // Generate MedlinePlus link using their search API
      const medlinePlusURL = `https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&v%3Asources=medlineplus-bundle&query=${encodeURIComponent(
        medicationName
      )}`;
  
      // Combine fields for a descriptive fallback
      const description = [
        `Name: ${medicationName}`,
        synonym !== 'No synonym available' ? `Synonym: ${synonym}` : '',
        `Type: ${typeDescription}`,
      ]
        .filter(Boolean)
        .join(', ');
  
      // Return medication details and MedlinePlus link
      return res.status(200).json({
        medication: medicationName,
        description,
        medlinePlusURL,
        rxCUI,
      });
    } catch (error) {
      console.error('Error fetching medication details:', error);
      return res.status(500).json({ error: 'Failed to fetch medication details' });
    }
  }
  