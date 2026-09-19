import "../styles/globals.css";
import { DM_Sans, League_Gothic } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const leagueGothic = League_Gothic({
  subsets: ["latin"],
  variable: "--font-league-gothic",
});

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${dmSans.variable} ${leagueGothic.variable} app-shell`}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
