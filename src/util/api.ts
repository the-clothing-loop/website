const getUserLocation = (accessToken: any) => {
  return fetch(`https://ipinfo.io/json?token=${accessToken}`)
    .then((response) => {
      return response.json();
    })
    .then((jsonResponse) => {
      return jsonResponse;
    });
};

export default getUserLocation;
