const getUserLocation = async (accessToken: string) => {
  const response = await fetch(`https://ipinfo.io/json?token=${accessToken}`);
  return response.json();
};

export default getUserLocation;
