import { App, DirectiveBinding } from "vue";

const tooltipDirective = (app: App) => {
    app.directive("tooltip", {
        mounted(el, binding) {
            init(el, binding);
        },
        updated(el, binding) {
            init(el, binding);
        }
    });
};

function init(el: HTMLElement, binding: DirectiveBinding) {
    let position = binding.arg || "top";
    let tooltipText = binding.value || "Tooltip text";
    el.setAttribute("position", position);
    el.setAttribute("tooltip", tooltipText);
}

export default tooltipDirective;
