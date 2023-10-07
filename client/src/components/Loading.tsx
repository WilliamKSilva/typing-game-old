import loadingPath from "../assets/loading.svg";
import './Loading.css';

export const Loading = () => {
  return (
    <div class="loading-wrapper">
      <img src={loadingPath} />
    </div>
  )    
}