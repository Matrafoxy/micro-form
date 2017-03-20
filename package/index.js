import React, { PropTypes, Component } from 'react'

const merge = (ownProps, newProps) => {
  const { fields, state } = ownProps

  Object.keys(fields).forEach(key => {
    if (newProps[key]) {
      fields[key](newProps[key])
      state[key] = newProps[key]
    }
  })

  return {
    fields,
    state
  }
}

export class Form extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fields: {},
      state: {}
    }
  }

  static childContextTypes = {
    setInitialGlobalState: PropTypes.func,
    setGlobalState: PropTypes.func,
    getGlobalState: PropTypes.func
  }

  getChildContext () {
    const _ = this

    return {
      setInitialGlobalState ({ name, value, update }) {
        _.setState({
          fields: Object.assign(_.state.fields, {
            [name]: update
          }),
          state: Object.assign(_.state.state, {
            [name]: value
          })
        })
      },
      setGlobalState (state) {
        _.setState(merge(_.state, state))
      },
      getGlobalState () {
        return _.state.state
      }
    }
  }

  render () {
    return this.props.children({
      state: this.state.state
    })
  }
}

export class Field extends Component {
  static contextTypes = {
    setInitialGlobalState: PropTypes.func,
    setGlobalState: PropTypes.func,
    getGlobalState: PropTypes.func
  }

  constructor (props, context) {
    super(props, context)

    this.state = {
      name: props.name,
      value: props.value || ''
    }
  }

  componentWillMount () {
    this.context.setInitialGlobalState({
      name: this.state.name,
      value: this.state.value,
      update: this.update.bind(this)
    })
  }

  update (value) {
    this.setState({
      value
    })
  }

  validate (value) {
    return this.props.validate ? this.props.validate(value) : true
  }

  render() {
    const globalState = this.context.getGlobalState()

    const props = {
      valid: this.props.validate ? this.props.validate(this.state.value, globalState) : true,
      setState: this.context.setGlobalState,
      state: globalState,
      ...this.state
    }

    return this.props.children(props)
  }
}