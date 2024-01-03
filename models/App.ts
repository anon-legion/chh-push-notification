import { Schema, model } from 'mongoose';
import { IApp } from './types';

const appSchema = new Schema<IApp>({
  appCode: {
    type: String,
    required: true,
  },
  appName: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const App = model<IApp>('App', appSchema);

export default App;
