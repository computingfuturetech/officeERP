import { useEffect, useState } from 'react';
import axios from 'axios';

const useFetchBanks = () => {
  const [bankList, setBankList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.get(
          process.env.REACT_APP_API_URL + `/user/bankList`,
          config
        );
        setBankList(response.data);
      } catch (error) {
        console.error('Error fetching bank list:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  return { bankList, loading, error };
};

export default useFetchBanks;
