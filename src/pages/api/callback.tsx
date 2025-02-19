import { NextApiRequest, NextApiResponse } from 'next';

export default function Callback(req: NextApiRequest, res: NextApiResponse) {
  const { query, body } = req;
  return res.redirect(302, `/callback?MD=${query.MD}&param=${body.param}&requestorTransId=${body.requestorTransId}&event=${body.event}`);
}
