import _cluster, { Cluster } from 'cluster';
const cluster = _cluster as unknown as Cluster;
import os from 'os';
import { Injectable } from '@nestjs/common';
import getCpusLength from 'get_cpus_length';
// const numCPUs = os.cpus().length;
// const numCPUs = (process.env.CLUSTER_COUNT || 1) as number
const numCPUs = getCpusLength();

@Injectable()
export class AppClusterService {
  static clusterize(callback: any): void {
    if (cluster.isPrimary) {
      console.log({ numCPUs });
      console.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork();
      });
    } else {
      console.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
