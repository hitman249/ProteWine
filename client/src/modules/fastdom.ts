import fast from 'fastdom';
import fastdomPromised from 'fastdom/extensions/fastdom-promised';

export type Fastdom = Omit<typeof fast, 'clear' | 'measure' | 'mutate'> & typeof fastdomPromised;
export default fast.extend(fastdomPromised) as Fastdom;
