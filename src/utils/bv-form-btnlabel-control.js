//
// Private component used by `b-form-datepicker` and `b-form-timepicker`
//
import Vue from './vue'
import { toString } from './string'
import dropdownMixin from '../mixins/dropdown'
import idMixin from '../mixins/id'
import normalizeSlotMixin from '../mixins/normailize-slot'
import { VBHover } from '../directives/hover/hover'
import { BIconChevronDown } from '../icons/icons'

// @vue/component
export const BVFormBtnlabelControl = /*#__PURE__*/ Vue.extend({
  name: 'BVFormBtnlabelControl',
  directives: {
    BHover: VBHover
  },
  mixns: [idMixin, normalizeSlotMixin, dropdownMixin],
  props: {
    value: {
      // This is the value placed on the hidden input
      // The formatted value is provided via the `formatted-value` slot
      type: String,
      default: ''
    },
    state: {
      // Tri-state prop: `true`, `false`, or `null`
      type: Boolean,
      // We must explicitly default to `null` here otherwise
      // Vue coerces `undefined` into Boolean `false`
      default: null
    },
    size: {
      type: String
      // default: null
    },
    name: {
      type: String
      // default: null
    },
    form: {
      type: String
      // default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    lang: {
      type: String
      // default: null
    },
    rtl: {
      // Applied to the value label
      type: Boolean,
      default: false
    },
    menuClass: {
      // Extra classes to apply to the `dropdown-menu` div
      type: [String, Array, Object]
      // default: null
    }
  },
  data() {
    return {
      isHovered: false,
      hasFocus: false
    }
  },
  computed: {
    idButton() {
      return this.safeId()
    },
    idLabel() {
      return this.safeId('_value_')
    },
    idMenu() {
      return this.safeId('_dialog_')
    },
    idWrapper() {
      return this.safeId('_outer_')
    }
  },
  methods: {
    focus() {
      if (!this.disabled) {
        try {
          this.$refs.toggle.focus()
        } catch {}
      }
    },
    blur() {
      if (!this.disabled) {
        try {
          this.$refs.toggle.blur()
        } catch {}
      }
    },
    setFocus(evt) {
      this.hasFocus = evt.type === 'focus'
    },
    handleHover(hovered) {
      this.isHovered = hovered
    }
  },
  render(h) {
    const idButton = this.idButton
    const idLabel = this.idLabel
    const idMenu = this.idMenu
    const idWrapper = this.idWrapper
    const disabled = this.disabled
    const readonly = this.readonly
    const required = this.required
    const isHovered = this.isHovered
    const hasFocus = this.hasFocus
    const state = this.state
    const visible = this.visible
    const size = this.size
    const value = this.value

    const btnScope = { isHovered, hasFocus, state, opened: visible }
    const $button = h(
      'button',
      {
        ref: 'toggle',
        staticClass: 'btn border-0 h-auto py-0',
        class: { [`btn-${size}`]: !!size },
        attrs: {
          id: idButton,
          type: 'button',
          disabled: disabled,
          'aria-haspopup': 'dialog',
          'aria-expanded': visible ? 'true' : 'false',
          'aria-invalid': state === false ? 'true' : null,
          'aria-required': required ? 'true' : null
        },
        directives: [{ name: 'b-hover', value: this.handleHover }],
        on: {
          mousedown: this.onMousedown,
          click: this.toggle,
          keydown: this.toggle, // Handle ENTER, SPACE and DOWN
          '!focus': this.setFocus,
          '!blur': this.setFocus
        }
      },
      [
        this.hasNormalizedSlot('button-content')
          ? this.normalizeSlot('button-content', btnScope)
          : h(BIconChevronDown, { props: { scale: 1.25 } })
      ]
    )

    // Hidden input
    let $hidden = h()
    if (this.name && !disabled) {
      $hidden = h('input', {
        attrs: {
          type: 'hidden',
          name: this.name || null,
          form: this.form || null,
          value: toString(value) || ''
        }
      })
    }

    // Dropdown content
    const $menu = h(
      'div',
      {
        ref: 'menu',
        staticClass: 'dropdown-menu p-2',
        class: [
          this.menuClass,
          {
            show: visible,
            'dropdown-menu-right': this.right
          }
        ],
        attrs: {
          id: idMenu,
          role: 'dialog',
          tabindex: '-1',
          'aria-modal': 'false',
          'aria-labelledby': idLabel
        },
        on: {
          keydown: this.onKeydown // Handle ESC
        }
      },
      [this.normalizeSlot('default', { opened: visible })]
    )

    // Value label
    const $label = h(
      'label',
      {
        staticClass: 'form-control text-break text-wrap border-0 bg-transparent h-auto pl-1 m-0',
        class: {
          // Mute the text if showing the placeholder
          'text-muted': !value,
          [`form-control-${size}`]: !!size,
          'is-invalid': state === false,
          'is-valid': state === true
        },
        attrs: {
          id: idLabel,
          for: idButton,
          dir: this.rtl ? 'rtl' : 'ltr',
          lang: this.lang || null,
          'aria-invalid': state === false ? 'true' : null,
          'aria-required': required ? 'true' : null
        },
        directives: [{ name: 'b-hover', value: this.handleHover }],
        on: {
          // Disable bubbling of the click event to
          // prevent menu from closing and re-opening
          '!click': evt => /* istanbul ignore next */ {
            evt.stopPropagation()
          }
        }
      },
      // If nothing to display, we render a `&nbps;` to keep the correct height
      [this.normalizeSlot('formatted-value') || toString(value) || '\u00A0']
    )

    // Return teh custom form control wrapper
    return h(
      'div',
      {
        staticClass:
          'b-form-btnlabel-control form-control d-flex h-auto dropdown align-items-stretch',
        class: [
          this.directionClass,
          {
            show: visible,
            focus: hasFocus,
            [`form-control-${size}`]: !!size,
            'is-valid': state === true,
            'is-invalid': state === false
          }
        ],
        attrs: {
          id: idWrapper,
          role: 'group',
          'aria-disabled': disabled,
          'aria-readonly': readonly && !disabled,
          'aria-labelledby': idLabel,
          'aria-invalid': state === false ? 'true' : null,
          'aria-required': required ? 'true' : null
          // The following is handled in CSS to prevent the button
          // from moving to the right end in rtl mode
          // dir: 'ltr'
        }
      },
      [$button, $hidden, $menu, $label]
    )
  }
})