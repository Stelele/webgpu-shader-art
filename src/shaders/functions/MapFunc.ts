import { PI } from "../constants"

const MapFunc = /* wgsl */ `
    fn map(value: f32, start1: f32, stop1: f32, start2: f32, stop2: f32) -> f32 {
        var b = start2;
        var c = stop2 - start2;
        var t = value - start1;
        var d = stop1 - start1;
        var p = .5;

        return c * t / d + b;
    }
`

// When is the Easing applied
const WhenEasingEnum = /* wgsl */ `
    const EASE_IN: u32 = 0;
    const EASE_OUT: u32 = 1;
    const EASE_IN_OUT: u32 = 2;
`

const EasingTypeEnum = /* wgsl */ `
    const LINEAR: u32 = 0;
    const QUADRATIC: u32 = 1;
    const CUBIC : u32= 2;
    const QUARTIC: u32 = 3;
    const QUINTIC: u32 = 4;
    const SINUSOIDAL: u32 = 5;
    const EXPONENTIAL: u32 = 6;
    const CIRCULAR: u32 = 7;
    const SQRT: u32 = 8;
`


const Map2Func = /* wgsl */ `    
    fn map2(value: f32, start1: f32, stop1: f32, start2: f32, stop2: f32, easingType: u32, whenEasing: u32) -> f32 {
        var b = start2;
        var c = stop2 - start2;
        var t = value - start1;
        var d = stop1 - start1;
        var p = .5;

        switch (easingType) {
            case LINEAR: {
                return linearEasing(b, c, t, d, p);
            }
            case SQRT: {
                return sqrtEase(b, c, t, d, p, whenEasing);
            }
            case QUADRATIC: {
                return quadraticEase(b, c, t, d, p, whenEasing);
            }
            case CUBIC: {
                return cubicEase(b, c, t, d, p, whenEasing);
            }
            case QUARTIC: {
                return quarticEase(b, c, t, d, p, whenEasing);
            }
            case QUINTIC: {
                return quinticEase(b, c, t, d, p, whenEasing);
            }
            case SINUSOIDAL: {
                return sinusoidalEase(b, c, t, d, p, whenEasing);
            }
            case EXPONENTIAL: {
                return exponentialEase(b, c, t, d, p, whenEasing);
            }
            case CIRCULAR: {
                return circularEase(b, c, t, d, p, whenEasing);
            }
            default: {
                return .0;
            }
        }
    }

    fn linearEasing(b: f32, c: f32, t: f32, d: f32, p: f32) -> f32 {
        return c * t / d + b;
    }

    fn sqrtEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                var t = t0 / d;
                return c * pow(t, p) + b;
            }
            case EASE_OUT: {
                var t = t0 / d;
                return c * (1 - pow(1 - t, p)) + b;
            }
            default: {
                var t = t0 / (d / 2);
                if (t < 1.) { return c / 2 * pow(t, p) + b; }
                return c / 2 * (2 - pow(2 - t, p)) + b;
            }
        }
    }

    fn quadraticEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing:u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                var t = t0 / d;
                return c * t * t + b;
            }
            case EASE_OUT: {
                var t = t0 / d;
                return -c * t * (t - 2) + b;
            }
            default: {
                var t = t0 / (d / 2);
                if (t < 1.) { return c / 2 * t * t + b; }
                t -= 1;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }
        }
    }

    fn cubicEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                var t = t0 / d;
                return c * t * t * t + b;
            }
            case EASE_OUT: {
                var t = t0 / d;
                t -= 1;
                return c * (t * t * t + 1) + b; 
            }
            default: {
                var t = t0 / (d / 2);
                if (t < 1) { return c / 2 * t * t * t + b; }
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }
        }
    }

    fn quarticEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                var t = t0 / d;
                return c * t * t * t * t + b;
            }
            case EASE_OUT: {
                var t = t0 / d;
                t -= 1;
                return -c * (t * t * t * t - 1) + b;      
            }
            default: {
                var t = t0 / (d / 2);
                if (t < 1) { return c / 2 * t * t * t * t + b; }
                t -= 2;
                return -c / 2 * (t * t * t * t - 2) + b;
            }
        }
    }

    fn quinticEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                var t = t0 / d;
                return c * t * t * t * t * t + b;
            }
            case EASE_OUT: {
                var t = t0 / d;
                t -= 1;
                return c * (t * t * t * t * t + 1) + b;   
            }  
            default: {
                var t = t0 / (d / 2);
                if (t < 1){ return c / 2 * t * t * t * t * t + b; }
                t -= 2;
                return c / 2 * (t * t * t * t * t + 2) + b;
            }
        }
    }

    fn sinusoidalEase(b: f32, c: f32, t: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                return -c * cos(t/d * (PI / 2)) + c + b;
            }
            case EASE_OUT: {
                return c * sin(t / d * (PI / 2)) + b;
            }
            default: {
                return -c / 2 * (cos(PI * t / d) - 1) + b;
            }
        }
    }

    fn exponentialEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                return c * pow(2, 10 * (t0 / d - 1)) + b;
            }
            case EASE_OUT: {
                return c * (-pow(2, -10 * t0 / d) + 1) + b;
            }
            default: {
                var t = t0 / (d / 2);
                if (t < 1){ return c / 2 * pow(2, 10 * (t - 1)) + b; }
                t -= 1;
                return c / 2 * (-pow(2, -10 * t) + 2) + b; 
            }
        }
    }

    fn circularEase(b: f32, c: f32, t0: f32, d: f32, p: f32, whenEasing: u32) -> f32 {
        switch (whenEasing) {
            case EASE_IN: {
                var t = t0 / d;
                return -c * (sqrt(1 - t * t) - 1) + b;
            }
            case EASE_OUT: {
                var t = t0 / d;
                t -= 1;
                return c * (sqrt(1 - t * t) - 1) + b;
            }
            default: {
                var t = t0 / (d / 2);
                if (t < 1){ return -c / 2 * (sqrt(1 - t * t) - 1) + b; }
                t -= 2;
                return c / 2 * (sqrt(1 - t * t) + 1) + b;
            }
        }
    }
`

const Map3Func = /* wgsl */ `
    fn map3(value: f32, start1: f32, stop1: f32, start2: f32, stop2: f32, v: f32, when: u32) -> f32 {
        var b = start2;
        var c = stop2 - start2;
        var t = value - start1;
        var d = stop1 - start1;
        var p = v;

        switch (when) {
            case EASE_IN: {
                t /= d;
                return c * pow(t, p) + b;
            }
            case EASE_OUT: {
                t /= d;
                return c * (1 - pow(1 - t, p)) + b;
            }
            default: {
                t /= d / 2;
                if (t < 1){ return c / 2 * pow(t, p) + b; }
                return c / 2 * (2 - pow(2 - t, p)) + b;
            }
        }
    }
`

export const Maps = /* wgsl */ `
    ${PI}
    ${EasingTypeEnum}
    ${WhenEasingEnum}

    ${MapFunc}
    ${Map2Func}
    ${Map3Func}
`