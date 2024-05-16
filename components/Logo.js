export default function Logo({ size }) {
  return (
    <div id="logo" className={size}>
      <img src="/logo.webp"/>
      <div style={{marginLeft: "10px"}}>
        <h1>Monolith BCI</h1>
      </div>
    </div>
  )
}
