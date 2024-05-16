export default function Logo({ size }) {
  return (
    <div id="logo" className={size}>
      <img src="/logo.webp"/>
      <div style={{marginLeft: "5px"}}>
        <h1>MONOLITH</h1>
	<h1>BRAIN-COMPUTER INTERFACES</h1>
      </div>
    </div>
  )
}
