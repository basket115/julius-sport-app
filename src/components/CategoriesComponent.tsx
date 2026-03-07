import React, { useState, useEffect } from 'react';

const CategoriesComponent: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbzyZN60q75nNVhqHWZBV6gbX6IEa7Zu1KmZkhttxPIzJmXjb3v03xLcOW5T3PxicqT8EA/exec?action=get_branding&kundenId=V004`
        );
        const data = await response.json();
        if (data.success) {
          setCategories(data.branding.Kategorien);
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
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {categories.length > 0 ? (
        <ul>
          {categories.map((category, index) => (
            <li key={index}>{category}</li>
          ))}
        </ul>
      ) : (
        <p>Keine Kategorien verfügbar.</p>
      )}
    </div>
  );
};

export default CategoriesComponent;
