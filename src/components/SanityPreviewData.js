import {useQuery} from "@sanity/react-loader";
import {HOME_QUERY} from "../sanity/queries";

export default function SanityPreviewData({children, initial}) {
  const {data} = useQuery(HOME_QUERY, {}, {initial});

  return children(data);
}
