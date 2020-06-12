import {Component} from "./helpers/component.js"
import {html, css} from "../../../../web_modules/lit-element.js"
import { registrationOptions } from "../core/msg.js"

class Watch extends Component {

  static get properties() {
    return {
      actor: { type: Object }
    }
  }

  static get styles() {
    return css`
      .container {
        position: absolute;
        top: 90px;
        left: 10px;
        padding: 5px;
        font-family: "Gill Sans", sans-serif;
        text-shadow: 1px 1px 2px white;
        background-color: rgba(240,240,240,0.44)
      }
      .attr {text-align: right;padding-right: 10px;font-weight: 700}
      .extraattr {text-align: right; font-style: italic; padding-right: 7px}
      .command {font-weight: 700}
    `;
  }

  constructor() {
    super()
  }

  renderObject(obj) {
    return html`
      <table>
        ${Object.entries(obj).map( ([name, value]) => value ? html`<tr><td class="extraattr">${name}</ts><td>${value}</td></tr>` : null)}
      </table>
     `
  }

  stripPackage(typename) {
    return typename.substr(typename.lastIndexOf(".") + 1)
  }

  renderValue(attr, value) {
    if (attr === "x" || attr === "y" || attr === "z") {
      return Math.round(value * 100) / 100
    }
    return typeof(value) === "object" ? this.renderObject(value) : value
  }

  render() {
    if (!this.actor) return null
    return html`
    <div class="container">
      <table>
        ${Object.entries(this.actor).filter(([attr, value]) => attr[0] !== '_').map(([attr, value]) => html`
          <tr>
            <td class="attr">${attr}</td>
            <td>${this.renderValue(attr, value)}</td>
          </tr>
        `)}
      </table>
      ${this.messagetypes && html`
        <div class="commands">
          Commands: 
          ${this.messagetypes.filter(msgtype => registrationOptions(msgtype.typename).ui).map(messagetype => html`
          <span class="command"><a href="#" @click=${() => messagetype.send()}>${this.stripPackage(messagetype.typename)}</a> </span>
          `)}
        </div>
      `}
    </div>
`
  }
}

customElements.define("actor-watch", Watch)
