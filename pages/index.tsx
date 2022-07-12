import type { NextPage } from 'next';
import BaseSlate from '../components/BaseSlate';

const Home: NextPage = () => {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-6 p-5'>
          <BaseSlate />
        </div>
      </div>
    </div>
  );
};

export default Home;
