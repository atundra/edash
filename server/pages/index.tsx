import Link from 'next/link';
import styles from './index.module.css';

const Index = () => {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.screen}>
          <div className={styles.text}>
            <h1 className={styles.header}>eDash</h1>
            <p>
              <Link href="/device">
                <a>My devices</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
