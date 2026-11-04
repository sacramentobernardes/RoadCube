import Link from "next/link";

/** Logotipo em texto: "RoadCube" com o ponto vermelho. */
export function Logo() {
  return (
    <Link href="/" className="text-xl font-bold tracking-[-0.04em]">
      RoadCube<span className="text-cube-red">.</span>
    </Link>
  );
}
