import Header from "../ui/header/Header";
import s from "../ui/asteroids/asteroids.module.css";
import orbital from "../ui/orbital/orbital.module.css";

export default function Loading() {
  return <><Header/><main className={`${orbital.theme} ${s.empty}`} aria-busy="true"><p>NASA near-Earth objects</p><h1>Opening the next encounter.</h1><p role="status">Retrieving the observations…</p></main></>;
}
