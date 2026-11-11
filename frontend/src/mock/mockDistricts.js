// Mock district administrative hierarchy and geographical boundaries
export const MOCK_DISTRICT = {
  id: 'dist-01',
  name: 'Kaveri District',
  state: 'Karnataka',
  headquarters: 'Kaveri City',
  totalPopulation: 1485000,
  taluks: [
    { id: 'taluk-central', name: 'Central Taluk', population: 580000, center: [12.9716, 77.5946] },
    { id: 'taluk-north', name: 'North Taluk', population: 340000, center: [13.0358, 77.5970] },
    { id: 'taluk-south', name: 'South Taluk', population: 295000, center: [12.9141, 77.6109] },
    { id: 'taluk-east', name: 'East Taluk', population: 270000, center: [12.9784, 77.6408] },
  ],
  center: [12.9716, 77.5946],
  zoom: 11
};

