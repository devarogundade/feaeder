<template>
    <span :tooltip="props.tooltipText" :position="props.position">
        <slot />
    </span>
</template>

<script setup lang="ts">

const props = defineProps({
    tooltipText: {
        type: String,
        default: "Tooltip text",
    },
    position: {
        default: "top",
        type: String,
    },
});
</script>

<style scoped lang="scss">
[tooltip] {
    &>* {
        display: inline-block;
    }

    & {
        position: relative;
        cursor: pointer;
    }

    &:before,
    &:after {
        text-transform: none;
        font-size: 12px;
        font-weight: 400;
        user-select: none;
        pointer-events: none;
        position: absolute;
        display: none;
        opacity: 0;
    }

    &:before {
        content: "";
        border: 5px solid transparent;
        z-index: 1001;
    }

    &:after {
        content: attr(tooltip);
        width: max-content;
        max-width: 240px;
        padding: 6px 12px;
        border-radius: 4px;
        box-shadow: 0 1em 2em -0.5em rgba(0, 0, 0, 0.2);
        background: var(--tooltip-bg);
        color: var(--tx-normal);
        z-index: 1000;
    }

    &:hover:before,
    &:hover:after {
        display: block;
    }

    /* position: TOP */
    &:not([position]):before,
    &[position^="top"]:before {
        bottom: 100%;
        border-bottom-width: 0;
        border-top-color: var(--tooltip-bg);
    }

    &:not([position]):after,
    &[position^="top"]::after {
        bottom: calc(100% + 5px);
    }

    &:not([position])::before,
    &:not([position])::after,
    &[position^="top"]::before,
    &[position^="top"]::after {
        left: 50%;
        transform: translate(-50%, -0.5em);
    }

    /* position: BOTTOM */
    &[position^="bottom"]::before {
        top: 105%;
        border-top-width: 0;
        border-bottom-color: var(--tooltip-bg);
    }

    &[position^="bottom"]::after {
        top: calc(105% + 5px);
    }

    &[position^="bottom"]::before,
    &[position^="bottom"]::after {
        left: 50%;
        transform: translate(-50%, 0.5em);
    }

    /* position: LEFT */
    &[position^="left"]::before {
        top: 50%;
        border-right-width: 0;
        border-left-color: var(--tooltip-bg);
        left: calc(0em - 5px);
        transform: translate(-0.5em, -50%);
    }

    &[position^="left"]::after {
        top: 50%;
        right: calc(100% + 5px);
        transform: translate(-0.5em, -50%);
    }

    /* position: RIGHT */
    &[position^="right"]::before {
        top: 50%;
        border-left-width: 0;
        border-right-color: var(--tooltip-bg);
        right: calc(0em - 5px);
        transform: translate(0.5em, -50%);
    }

    &[position^="right"]::after {
        top: 50%;
        left: calc(100% + 5px);
        transform: translate(0.5em, -50%);
    }

    /* FX All The Things */
    &:not([position]):hover::before,
    &:not([position]):hover::after,
    &[position^="top"]:hover::before,
    &[position^="top"]:hover::after,
    &[position^="bottom"]:hover::before,
    &[position^="bottom"]:hover::after {
        animation: tooltips-vert 300ms ease-out forwards;
    }

    &[position^="left"]:hover::before,
    &[position^="left"]:hover::after,
    &[position^="right"]:hover::before,
    &[position^="right"]:hover::after {
        animation: tooltips-horz 300ms ease-out forwards;
    }
}

/* don't show empty tooltips */
[tooltip=""]::before,
[tooltip=""]::after {
    display: none !important;
}

/* KEYFRAMES */
@keyframes tooltips-vert {
    to {
        opacity: 0.9;
        transform: translate(-50%, 0);
    }
}

@keyframes tooltips-horz {
    to {
        opacity: 0.9;
        transform: translate(0, -50%);
    }
}
</style>