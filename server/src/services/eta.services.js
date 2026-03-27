import axios from "axios";

export const calculateETA = async (origin, destination) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;

  const res = await axios.get(url, {
    params: {
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  const element = res.data.rows[0].elements[0];

  return {
    distance: element.distance.text,
    duration: element.duration.value/60
    // minutes
  };
};