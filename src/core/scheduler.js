// SPDX-License-Identifier: LGPL-3.0-only

import { PostOffice, Addr, LOCALPOSTCODE } from "./postoffice.js"
import { Msg, RegistrationRequest, NameQuery } from "./msg.js"

export class ActorService {
    constructor(scheduler, actor) {
        this.scheduler = scheduler
        this.actor = actor
    }

    send(to, messagebody) {
        const msg = new Msg(this.actor.address, to, messagebody)
        if (to.postcode === LOCALPOSTCODE) {
            this.scheduler.deliver(msg)
        } else {
            this.scheduler.postoffice.send(msg)
        }
    }

    register() {
        this.send(this.scheduler.postoffice.masteraddr, new RegistrationRequest(this.actor.address))
    }

    querymastername(name) {
        this.send(this.scheduler.postoffice.masteraddr, new NameQuery(name))
    }
}

export class Scheduler {
    constructor(masterurl="ws://localhost:2497") {
        this.postoffice = new PostOffice(masterurl, this)
        this.messagequeue = []
        this.actorcache = new Map()
        this.actors = []
    }

    async init(actors=[]) {
        await this.postoffice.opened()
        actors.forEach(a => this.schedule(a))
    }

    schedule(actor) {
        this.actors.push(actor)
        actor.service = new ActorService(this, actor)
        actor.address = new Addr()
        this.actorcache.set(actor.address.toString(), actor)
        actor.onschedule()
    }

    deliver(message) {
        this.messagequeue.push(message) // local-only delivery
    }

    step() {
        const message = this.messagequeue.pop()
        const actor = this.actorcache.get(message.target.toString())
        if (actor) {
            actor.onmessage(message.body)
        } else {
            console.log("invalid recipient for message", message)
        }
    }

    run(message=null) {
        if (message) {
            this.deliver(message)
        }
        while (this.messagequeue.length) {
            this.step()
        }
    }

    shutdown() {
        this.postoffice.shutdown()
    }
}