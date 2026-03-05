import React, { useState, useEffect } from 'react';

const CategoriesComponent: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);  // Kategorien speichern
  const [loading, setLoading] = useState<boolean>(true);  // Ladezustand
  const [error, setError] = useState<string | null>(null);  // Fehlerzustand

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbwY655J19xdqsAg904r4DdRdqL3Zl58hgIURHi9lnpYga8NeWZno0iBrY27ftoqiDywRg/exec?action=get_branding&kundenId=V004`
        );
        const data = await response.json();
        console.log("API Antwort:", data);  // Protokolliere die Antwort

        if (data.success) {
          setCategories(data.branding.Kategorien);  // Kategorien setzen
        } else {
          setError('Fehler beim Laden der Kategorien');
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <h3>Kategorien</h3>
      {loading && <p>Loading...</p>}  {/* Ladeanzeige */}
      {error && <p>{error}</p>}  {/* Fehleranzeige */}
      {categories.length > 0 ? (
        <ul>
          {categories.map((category, index) => (
            <li key={index}>{category}</li>
          ))}
        </ul>
      ) : (
        <p>Keine Kategorien verfügbar.</p>  {/* Anzeige, falls keine Kategorien vorhanden sind */}
      )}
    </div>
  );
};

export default CategoriesComponent;
