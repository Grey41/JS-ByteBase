`
        precision highp float;
        varying vec2 coordinate;

        uniform vec2 size;
        uniform vec2 phase;
        uniform sampler2D sampler;
        uniform float flash;

        void main(void) {
            float zoom = 500.0;
            float value;
            float thing;

            vec2 pos = vec2((gl_FragCoord.x - size.x / 2.0) / zoom, (gl_FragCoord.y - size.y / 2.0) / zoom);
            vec2 solid = pos;

            for (float index = 0.0; index < 200.0; index ++) {
                vec2 power = vec2(pos.x * pos.x - pos.y * pos.y, 2.0 * pos.x * pos.y);
                pos.x = power.x + solid.x;
                pos.y = power.y + solid.y;

                if (pos.x * pos.y > 5.0) {
                    thing = index;
                    break;
                }
            }

            for (float index = 0.0; index < 200.0; index ++) {
                float next = pos.x * pos.x - pos.y * pos.y + phase.x;
                pos.y = 2.0 * pos.x * pos.y + phase.y;
                pos.x = next;

                if (pos.x * pos.y > 5.0) {
                    value = index;
                    break;
                }
            }

            //float color = value / (abs(size.y / 2.0 - gl_FragCoord.y) / value) / (abs(size.x / 2.0 - gl_FragCoord.x) / value);

            float distance = sqrt(pow(size.x / 2.0 - gl_FragCoord.x, 2.0) + pow(size.y / 2.0 - gl_FragCoord.y, 2.0)) / 20.0;
            float shape = (abs(size.y / 2.0 - gl_FragCoord.y) / value) / (abs(size.x / 2.0 - gl_FragCoord.x) / value);
            float color = value / flash / distance;

            gl_FragColor = vec4(color, color / 2.0, color / 4.0, 1) * texture2D(sampler, coordinate);


            //gl_FragColor = vec4(color, color / 2.0, color / 4.0, 1);
        }`