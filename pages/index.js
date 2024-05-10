import Logo from "@/components/Logo";
import { motion, useViewportScroll } from "framer-motion"
import Demo from "@/components/landing/Demo";
import { useState, useEffect } from 'react'
import { get } from '@/lib/fetch'
import Board from "@/components/landing/Board";

// Goal: get the PCB to remain on screen to "start with the board."

export default function Index() {
  const { scrollYProgress } = useViewportScroll();
const [data, setData] = useState([])
  const [pause, setPause] = useState(null)

  const read = () => {
    get({
      route: '/api/landing'
    }).then((json) => {
      setData(old => {
        if (!old.length) {
          let fill = []
          for (let channel of json.data.channels) fill.push([channel])
          return fill
        } else if (old.length > 200) {
          // Let's trim it a bit so it never overflows
          return old.splice(0, 100)
        }
        return old.map((channel, i) => {
          return [...channel, json.data.channels[i]]
        })
      })
    })
  }

  useEffect(() => {
    setPause(setInterval(read, 100))
    return () => {
      setPause(old => {
        if (old) clearInterval(old)
        return null
      })
    }
  }, [])

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
    <nav>
      <Logo size="sm"/>
      <div>
        <p className="link">preorder</p>
        <p className="link">funding</p>
      </div>
    </nav>
    </motion.div>
      <header>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <h1>monolith.</h1>
        <h1>a board that'll let you control your computer just by <i>thinking</i>.</h1>
        </motion.div>
        <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.8 }}>
        <img src="/board.png"/></motion.div>
        <h3 className="preorder">preorder starting from $299</h3>
      </header>
      <div className="colors">
        <div />
      <div />
      <div />
      <div />
      </div>
      <section className="section" >
        <h1>start with the board.</h1>
        {/* <Board/> */}
        <div style={{ minHeight: "50vh"}}/>
        <div className="features">
          <div>
          <h2>ads1299. 8 channels.</h2>
          <p>Our PCB uses the ADS1299 to process electrode signals, supporting up to eight channels with an eventual optional to add more channels with a addon board.</p>
          </div>
          <div>
            <h2>bluetooth.</h2>
            <p>To interface with out board, data over Bluetooth is supported, allowing for wireless wearability.</p>
          </div>
          <div>
            <h2>open source.</h2>
            <p>Completely open source, licensed under MIT.</p>
          </div>
        </div>
      </section>
      <section className="section"  id="blue">
        <h1>we’re building more than just the most financially accessible board, though. we’re building the complete pipeline.</h1>
        <div>
          <div>
        <div>
          <h2>store datasets.</h2>
        </div>
        <div>
          <h2>custom firmware.</h2>
        </div>
        <div>
          <h2>multiple modalities.</h2>
        </div>
        </div>
        <Demo data={data}
            pause={pause}
            setPause={setPause}
            read={() => read()}/>
          </div>
      </section>
       <div className="top">
        <div>
          <div className="left"></div>
          <div className="right"></div>
          </div>
        </div>
      <section className="section"  id="about">
        <h1>[why]</h1>
        <p>The mind is the final frontier of human exploration. We're building telescopes for the next Galileo. We've been working on building the most affordable and refined devices to connect minds and machines.</p>
        <p>We're a group of five teenagers (<a href="https://twitter.com/arithmoquine" target="_blank">Henry</a>, <a href="https://cheru.dev" target="_blank">Cheru</a>, <a href="https://braindump.ing">JC</a>, <a href="TODO">Sophia</a>, and <a href="TODO">Nila</a>) working on building a complete, accessible pipeline for brain computer interfaces. Our system consists of an inexpensive board for reading signals and ML software to process this data. We work in person in Burlington, VT during five day sprints, although we've also done a five day sprint in San Francisco.</p>
        <p>EEG hardware are expensive, with the average processing board costing upwards of $1,000, not including other necessary components like electrodes. Our goal is to build the pipeline we wish we'd had for 1/5th of the price, and 1/5th the time.</p>
        <h1>[timeline]</h1>
        <p>Our PCB, the Trillium, utilizes the ADS1299. It contains everything needed to take electrode signals, filter noise, and send them to a computer using an ESP32. It's completely open sourced and in active development on <a className="link" href="https://github.com/Monolith-BCI/Trillium-PCB">GitHub</a>.</p>
        <p>Currently, our roadmap is to finalize board development and finish the rest of the pipeline by the end of summer 2024, and begin shipping out preordered boards. The rest of the pipeline entails three very specific tasks: to a) productize our dashboard and use it to b) collect data from various groups to c) train a set of models for detecting modalities, such as left/right/up/down movement.</p>
        <p id="funding">We're currently looking for funding to be able to work full-time on this during the summer of 2024. If you are interested or know someone who would be interested in even giving a small grant, email us at monolith[at]monolithbci[dot]com.</p>
        <div className="signatures">
          <img src="/landing/signatures/cheru.svg"/>
          <img src="/landing/signatures/henry.svg"/>
          <img src="/landing/signatures/jc.svg"/>
          <img src="/landing/signatures/nila.svg"/>
          <img src="/landing/signatures/sophia.svg"/>
        </div>
      </section>
      <footer>
        <Logo size="sm"/>
        <div className="footer">
          <p>inquiries - monolith[at]monolithbci[dot]com</p>
          <p><a href="https://github.com/Monolith-BCI">github</a></p>
          <p><a href="https://twitter.com/monolith_bci">twitter</a></p>
        </div>
      </footer>
    </>
  )
}