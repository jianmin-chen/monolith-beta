export default function Logo({ size }) {
  return (
    <div id="logo" className={size}>
      <img src="/logo.webp"/>
      <div>
        <h1>MONOLITH</h1>
        <h1>mind-machine interfaces</h1>
      </div>
    </div>
  )
}