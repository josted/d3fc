import {line as lineShape} from 'd3-shape';
import { scaleIdentity } from 'd3-scale';
import {rebind} from '@d3fc/d3fc-rebind';
import constant from '../constant';

export default () => {

    let xScale = scaleIdentity();
    let yScale = scaleIdentity();
    let value = d => d;
    let label = value;
    let decorate = () => {};
    let orient = 'horizontal';

    const lineData = lineShape();

    const instance = (data) => {
        if (orient !== 'horizontal' && orient !== 'vertical') {
            throw new Error('Invalid orientation');
        }
        const horizontal = orient === 'horizontal';
        const context = lineData.context();
        // the value scale which the annotation 'value' relates to, the crossScale
        // is the other. Which is which depends on the orienation!
        const crossScale = horizontal ? xScale : yScale;
        const valueScale = horizontal ? yScale : xScale;
        const crossDomain = crossScale.domain();
        const textOffsetX = horizontal ? 9 : 0;
        const textOffsetY = horizontal ? 0 : 9;
        const textAlign = horizontal ? 'left' : 'center';
        const textBaseline = horizontal ? 'middle' : 'hanging';

        data.forEach((d, i) => {
            context.save();
            context.beginPath();
            context.strokeStyle = '#bbb';
            context.fillStyle = '#000';
            context.textAlign = textAlign;
            context.textBaseline = textBaseline;

            decorate(context, d, i);

            // Draw line
            lineData.context(context)(crossDomain.map(extent => {
                const point = [crossScale(extent), valueScale(value(d))];
                return horizontal ? point : point.reverse();
            }));

            // Draw label
            const x = horizontal ? crossScale(crossDomain[1]) : valueScale(value(d));
            const y = horizontal ? valueScale(value(d)) : crossScale(crossDomain[1]);
            context.fillText(label(d), x + textOffsetX, y + textOffsetY);

            context.fill();
            context.stroke();
            context.closePath();
            context.restore();
        });
    };

    instance.xScale = (...args) => {
        if (!args.length) {
            return xScale;
        }
        xScale = args[0];
        return instance;
    };
    instance.yScale = (...args) => {
        if (!args.length) {
            return yScale;
        }
        yScale = args[0];
        return instance;
    };
    instance.value = (...args) => {
        if (!args.length) {
            return value;
        }
        value = constant(args[0]);
        return instance;
    };
    instance.label = (...args) => {
        if (!args.length) {
            return label;
        }
        label = constant(args[0]);
        return instance;
    };
    instance.decorate = (...args) => {
        if (!args.length) {
            return decorate;
        }
        decorate = args[0];
        return instance;
    };
    instance.orient = (...args) => {
        if (!args.length) {
            return orient;
        }
        orient = args[0];
        return instance;
    };

    rebind(instance, lineData, 'context');

    return instance;
};
