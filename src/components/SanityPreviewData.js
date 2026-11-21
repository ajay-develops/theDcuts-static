import {useQuery} from "@sanity/react-loader";
import {HOME_QUERY} from "../sanity/queries";
import {mapHomeData} from "../portfolio/mapProject";

export default function SanityPreviewData({children, initial}) {
  const {data} = useQuery(HOME_QUERY, {}, {initial});

  return children(mapHomeData(data));
}
