import { useSearchParams } from 'react-router-dom';

const useQueryParam = (paramName) => {
  const [searchParams] = useSearchParams();
  return searchParams.get(paramName);
};

export default useQueryParam;