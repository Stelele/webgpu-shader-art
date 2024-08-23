import { Uniforms, VertexOut } from "../vertices";

export const TestFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = in.cell / grid;
        var col = vec4f(0.);

        let snst = sunset(uv);
        col = mix(col, snst, snst.a);

        let sn = sun(uv);
        col = mix(col, sn, sn.a);

        let r = tree(uv + vec2f(0.3, 0.2));
        col = mix(col, vec4f(0.2, 0.6, 0.2, 1), r);

        return col;
    }

    fn sunset(uv: vec2f) -> vec4f {
        var grad = vec4f(uv.y, 0, 0, 1);
        var col = mix(vec4f(1, 0.5, 0, 1), grad, 0.7 - uv.y);
        return col;
    }

    fn sun(uv0: vec2f) -> vec4f {
        var uv = 2 * uv0 - 1;
        uv.x *= resolution.x / resolution.y;

        uv += vec2f(0.5, -0.4);

        var d = length(uv);
        var out = smoothstep(0.5, 0.51, d);
        var outCol = mix(vec4f(0.9, 0.7, 0, 1), vec4f(0), out);
        return outCol;
    }

    fn tree(uv0: vec2f) -> f32 {
        var uv = 2 * uv0 - 1;
        uv.x *= resolution.x / resolution.y;
        uv *= 2;
        let blur = 0.01;

        var tree = tapperedRect(uv, .7, -1, 0, -.4, blur);
        tree += tapperedRect(uv, 1.2, -1., .4, .0, blur);
        tree += tapperedRect(uv, 1.5, -1., 1.2, .3, blur);
        tree += rect(uv, -0.1, 0.1, -.4, -.8, 0.005);
        
        return clamp(0, 1, tree);
    }

    fn tapperedRect(uv: vec2f, bottomWidth: f32, topWidth: f32, top: f32, bottom: f32, blur: f32) -> f32 {
        var left =  mix(-bottomWidth/2, -topWidth/2, uv.y); 
        var right = mix(bottomWidth/2, topWidth/2, uv.y);       
        let r = rect(uv, left, right, top, bottom, blur);

        return clamp(0, 1, r);
    }

    fn rect(uv: vec2f, left: f32, right: f32, top: f32, bottom: f32, blur: f32) -> f32 {
        var out = smoothstep(left-blur, left+blur, uv.x) * 
            smoothstep(right+blur, right-blur, uv.x) *
            smoothstep(bottom-blur, bottom+blur, uv.y) * 
            smoothstep(top+blur, top-blur, uv.y);
            
        return clamp(0, 1,out);
    }
`