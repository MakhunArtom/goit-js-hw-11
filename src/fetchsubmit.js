import axios from 'axios';

export async function fetchSubmit(name, page) {
  const basUrl = `https://pixabay.com/api/`;
  const key = `?key=30147666-01af3a5d8270a6833dad9b4e7`;
  const search = `&q=${name}`;
  const option = `&image_type=photo&orientation=horizontal&safesearch=true`;
  const pagination = `&page=${page}&per_page=40`;

  return await axios(basUrl + key + search + option + pagination).then(
    response => {
      return response.data;
    }
  );
}
