import Logo from '@/components/Logo'
import { motion, useViewportScroll } from 'framer-motion'
import Demo from '@/components/landing/Demo'
import { useState, useEffect } from 'react'
import { get } from '@/lib/fetch'
import Board from '@/components/landing/Board'

// Goal: get the PCB to remain on screen to "start with the board."

export default function Index() {
  const { scrollYProgress } = useViewportScroll()
  const [data, setData] = useState([])
  const [pause, setPause] = useState(null)

  const read = () => {
    get({
      route: '/api/landing'
    }).then(json => {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <nav>
          <Logo size="sm" />
          <div>
            <p className="link">
              <a href="https://forms.fillout.com/t/7ETq36bavRus">
                join waitlist
              </a>
            </p>
          </div>
        </nav>
      </motion.div>
      <header>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}>
          <h1>monolith:</h1>
          <h1>
            a device that'll let you control your computer just by{' '}
            <i>thinking</i>.
          </h1>
        </motion.div>
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.8 }}>
          <img src="/board.png" />
        </motion.div>
        <h3 className="preorder">
          <a href="https://forms.fillout.com/t/7ETq36bavRus">join waitlist</a>
        </h3>
      </header>
      <div className="colors">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <section className="section">
        <h1>start with the board.</h1>
        <img src="/board.png" />
        <div className="features">
          <div>
            <h2>ads1299. 8 channels.</h2>
            <p>
              Our PCB uses the ADS1299 to process electrode signals, supporting
              up to eight channels with support for more channels planned.
            </p>
          </div>
          <div>
            <h2>bluetooth.</h2>
            <p>
              To interface with the board, communicating over Bluetooth is supported,
              allowing for wireless wearability.
            </p>
          </div>
          <div>
          </div>
        </div>
      </section>
      <section className="section" id="blue">
        <h1>
          we’re building more than just the most accessible board,
          though. we’re building the complete pipeline.
        </h1>
        <div>
          <div>
            <div>
              <h2>plug-and-play web ui.</h2>
            </div>
            <div>
              <h2>record and store data.</h2>
            </div>
            <div>
              <h2>classify multiple modalities.</h2>
            </div>
          </div>
          <Demo
            data={data}
            pause={pause}
            setPause={setPause}
            read={() => read()}
          />
        </div>
      </section>
      <div className="top">
        <div>
          <div className="left"></div>
          <div className="right"></div>
        </div>
      </div>
      <section className="section" id="about">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}>
          <h1>[why]</h1>
        </motion.div>
        <p>
          The mind is the final frontier of human exploration. We're building
          telescopes for the next Galileo. We've been working on building the
          most affordable and refined devices to connect minds and machines.
        </p>
        <p>
          We're a group of five teenagers (
          <a href="https://twitter.com/arithmoquine" target="_blank">
            Henry
          </a>
          ,{' '}
          <a href="https://cheru.dev" target="_blank">
            Cheru
          </a>
          , <a href="https://jianminchen.com" target="_blank">JC</a>, <a href="https://www.linkedin.com/in/sophiapung/" target="_blank">Sophia</a>,
          and <a href="https://www.linkedin.com/in/nila-palmo-ram/" target="_blank">Nila</a>) working on building a complete,
          accessible pipeline for brain computer interfaces. Our system consists
          of an inexpensive board for reading signals and ML software to process
          this data. We've been working on this remotely since November.
        </p>
        <p>
          EEG hardware is expensive, with the average processing board costing
          upwards of $1,000, not including other necessary components like
          electrodes. Our goal is to build the pipeline we wish we'd had for
          1/5th of the price.
        </p>
        <h1>[timeline]</h1>
        <p>
          Our PCB, the Trillium, utilizes the ADS1299. It contains everything
          needed to take electrode signals, filter noise, and send them to a
          computer, wirelessly, using an ESP32.
        </p>
        <p>
          Currently, our plan is to finalize board development and begin
	  to ship out boards by the end of Summer 2024.
	  Then, we'll focus on utilizing our web dashboard to collect brain data
	  and train a model to classify motor imagery (imagining moving your hands left/right/up/down).
        </p>
        <p id="funding">
          We're currently looking for funding to continue to work on
          this during the summer of 2024. If you are interested in meeting us, you can email us at
          team[at]monolithbci[dot]com.
        </p>
        <div className="signatures">
          <img src="/landing/signatures/cheru.svg" />
          <img src="/landing/signatures/henry.svg" />
          <img src="/landing/signatures/jc.svg" />
          <img src="/landing/signatures/nila.svg" />
          <img src="/landing/signatures/sophia.svg" />
        </div>
      </section>
      <footer>
        <Logo size="sm" />
        <div className="footer">
          <p>inquiries - team[at]monolithbci[dot]com</p>
          <p>
            <a href="https://github.com/Monolith-BCI">github</a>
          </p>
          <p>
            <a href="https://twitter.com/monolith_bci">twitter</a>
          </p>
        </div>
      </footer>
    </>
  )
}
